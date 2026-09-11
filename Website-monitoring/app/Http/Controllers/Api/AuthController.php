<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as AuthFacade;
use Illuminate\Validation\Rules\Password;
use Kreait\Firebase\Contract\Auth as FirebaseAuth;
use Kreait\Firebase\Exception\Auth\EmailExists;

class AuthController extends Controller
{
    public function __construct(
        protected FirebaseAuth $firebaseAuth,
        protected UserRepository $userRepo,
    ) {
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
        ]);

        $createdUid = null;

        try {
            $userProperties = [
                'email' => $validated['email'],
                'password' => $validated['password'],
                'displayName' => $validated['name'],
            ];

            try {
                // 1. Buat user di Firebase Authentication
                $createdUser = $this->firebaseAuth->createUser($userProperties);
                $uid = (string) $createdUser->uid;
                $createdUid = $uid;
            } catch (EmailExists $e) {
                // Jika sudah terdaftar di Firebase Auth (misal registrasi sebelumnya gagal di Firestore)
                try {
                    $existingUser = $this->firebaseAuth->getUserByEmail($validated['email']);
                    $uid = (string) $existingUser->uid;

                    // Cek apakah profil sudah ada di Firestore
                    try {
                        $profile = $this->userRepo->findById($uid);
                    } catch (\Throwable $ex) {
                        $profile = null;
                    }

                    if ($profile) {
                        return response()->json([
                            'message' => 'Email ini sudah terdaftar di Firebase. Silakan login.',
                            'errors' => ['email' => ['Email sudah terdaftar. Silakan login.']],
                        ], 422);
                    }
                } catch (\Throwable $ex) {
                    return response()->json([
                        'message' => 'Email ini sudah terdaftar di Firebase.',
                        'errors' => ['email' => ['Email ini sudah digunakan.']],
                    ], 422);
                }
            }

            // 2. Simpan profil di Cloud Firestore (koleksi users)
            $userProfile = [
                'id' => $uid,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => 'user',
            ];

            try {
                $this->userRepo->createUser($userProfile, $uid);
            } catch (\Throwable $dbException) {
                // Rollback user di Firebase Auth jika user baru dibuat dan Firestore gagal
                if ($createdUid) {
                    try {
                        $this->firebaseAuth->deleteUser($createdUid);
                    } catch (\Throwable $ignored) {}
                }

                $msg = $dbException->getMessage();
                if (str_contains($msg, 'The database (default) does not exist') || str_contains($msg, 'NOT_FOUND')) {
                    return response()->json([
                        'message' => 'Database Cloud Firestore belum diaktifkan di Firebase Console! Buka Firebase Console > Build > Firestore Database > klik "Create database".',
                    ], 500);
                }

                throw $dbException;
            }

            // 3. Buat custom token untuk login otomatis
            $customToken = $this->firebaseAuth->createCustomToken($uid)->toString();

            return response()->json([
                'message' => 'Registrasi berhasil.',
                'data' => [
                    'user' => $userProfile,
                    'token' => $customToken,
                    'firebase_uid' => $uid,
                ],
            ], 201);

        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'The database (default) does not exist') || str_contains($msg, 'NOT_FOUND')) {
                return response()->json([
                    'message' => 'Database Cloud Firestore belum diaktifkan di Firebase Console! Buka Firebase Console > Build > Firestore Database > klik "Create database".',
                ], 500);
            }

            return response()->json([
                'message' => 'Registrasi gagal: ' . $msg,
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        try {
            $signInResult = $this->firebaseAuth->signInWithEmailAndPassword(
                $validated['email'],
                $validated['password']
            );

            $idToken = $signInResult->idToken();
            $uid = $signInResult->firebaseUserId();

            try {
                $userProfile = $this->userRepo->findById($uid);
            } catch (\Throwable $dbException) {
                $msg = $dbException->getMessage();
                if (str_contains($msg, 'The database (default) does not exist') || str_contains($msg, 'NOT_FOUND')) {
                    return response()->json([
                        'message' => 'Database Cloud Firestore belum diaktifkan di Firebase Console! Buka Firebase Console > Build > Firestore Database > klik "Create database".',
                    ], 500);
                }
                $userProfile = null;
            }

            if (! $userProfile) {
                $userProfile = [
                    'id' => $uid,
                    'name' => $signInResult->data()['displayName'] ?? $validated['email'],
                    'email' => $validated['email'],
                    'role' => 'user',
                ];
                try {
                    $this->userRepo->createUser($userProfile, $uid);
                } catch (\Throwable $e) {
                    // Abaikan jika Firestore belum siap
                }
            }

            try {
                $this->userRepo->updateLastLogin($uid);
            } catch (\Throwable $e) {}

            return response()->json([
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => [
                        'id' => $uid,
                        'name' => $userProfile['name'] ?? '',
                        'email' => $userProfile['email'] ?? $validated['email'],
                        'role' => $userProfile['role'] ?? 'user',
                    ],
                    'token' => $idToken,
                    'refresh_token' => $signInResult->refreshToken(),
                ],
            ]);

        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'The database (default) does not exist') || str_contains($msg, 'NOT_FOUND')) {
                return response()->json([
                    'message' => 'Database Cloud Firestore belum diaktifkan di Firebase Console! Buka Firebase Console > Build > Firestore Database > klik "Create database".',
                ], 500);
            }

            return response()->json([
                'message' => 'Kredensial tidak valid atau akun tidak ditemukan: ' . $msg,
            ], 401);
        }
    }

    public function logout(Request $request)
    {
        $uid = (string) (AuthFacade::id() ?? $request->attributes->get('firebase_uid'));

        if ($uid) {
            try {
                $this->firebaseAuth->revokeRefreshTokens($uid);
            } catch (\Throwable $e) {
                // Ignore jika token sudah tidak valid
            }
        }

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $uid = (string) (AuthFacade::id() ?? $request->attributes->get('firebase_uid'));

        if ($user) {
            return response()->json([
                'data' => [
                    'id' => $user->getAuthIdentifier() ?? $uid,
                    'name' => $user->name ?? '',
                    'email' => $user->email ?? '',
                    'role' => $user->role ?? 'user',
                ],
            ]);
        }

        try {
            $profile = $uid ? $this->userRepo->findById($uid) : null;
        } catch (\Throwable $e) {
            $profile = null;
        }

        return response()->json([
            'data' => [
                'id' => $uid,
                'name' => $profile['name'] ?? '',
                'email' => $profile['email'] ?? '',
                'role' => $profile['role'] ?? 'user',
            ],
        ]);
    }
}
