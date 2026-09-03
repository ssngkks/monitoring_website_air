<?php

namespace App\Http\Middleware;

use App\Models\Node;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyNodeToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $kodeNode = $request->input('kode_node');
        $token = $request->input('api_token');

        if (! $kodeNode || ! $token) {
            return response()->json([
                'message' => 'kode_node dan api_token wajib diisi.',
            ], 401);
        }

        $node = Node::where('kode_node', $kodeNode)->first();

        if (! $node || $node->status !== 'active') {
            return response()->json([
                'message' => 'Node tidak ditemukan atau tidak aktif.',
            ], 401);
        }

        $incomingHash = hash('sha256', $token);

        if (! hash_equals($node->api_token_hash, $incomingHash)) {
            return response()->json([
                'message' => 'Token tidak valid.',
            ], 401);
        }

        $request->attributes->set('node', $node);

        return $next($request);
    }
}
