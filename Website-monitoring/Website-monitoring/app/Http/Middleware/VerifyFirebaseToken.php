<?php

namespace App\Http\Middleware;

use App\Models\FirebaseUser;
use App\Repositories\UserRepository;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as AuthFacade;
use Kreait\Firebase\Contract\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerifyFirebaseToken
{
    public function __construct(protected Auth $auth)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = (string) $verifiedIdToken->claims()->get('sub');
            $claims = $verifiedIdToken->claims()->all();

            $userRepo = app(UserRepository::class);
            $user = $userRepo->findById($uid);

            if (!$user) {
                // Auto-create or initialize user profile from token claims
                $userData = [
                    'id' => $uid,
                    'name' => $claims['name'] ?? $claims['email'] ?? 'User',
                    'email' => $claims['email'] ?? '',
                    'role' => $claims['role'] ?? 'user',
                ];
                $userRepo->createUser($userData, $uid);
                $user = $userData;
            }

            $user['id'] = $uid;
            $user['firebase_claims'] = $claims;

            $firebaseUser = new FirebaseUser($user);

            // Register into Laravel Auth facade & request
            AuthFacade::setUser($firebaseUser);
            $request->setUserResolver(fn () => $firebaseUser);

            $request->attributes->set('user', $firebaseUser);
            $request->attributes->set('firebase_uid', $uid);
            $request->attributes->set('firebase_claims', $claims);

        } catch (\Kreait\Firebase\Exception\Auth\InvalidIdToken $e) {
            return response()->json(['message' => 'Invalid token: ' . $e->getMessage()], 401);
        } catch (\Kreait\Firebase\Exception\Auth\ExpiredIdToken $e) {
            return response()->json(['message' => 'Token expired.'], 401);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Authentication failed: ' . $e->getMessage()], 401);
        }

        return $next($request);
    }
}