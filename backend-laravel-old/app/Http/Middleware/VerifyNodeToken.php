<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class VerifyNodeToken
{
    public function handle(Request $request, Closure $next): mixed
    {
        $apiToken = $request->header('api-token');

        if (!$apiToken) {
            return response()->json(['error' => 'Missing api-token header'], 401);
        }

        $node = \App\Models\Node::where('kode_node', $request->header('kode-node'))->first();

        if (!$node || !hash_equals(hash('sha256', $apiToken), $node->api_token_hash)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}