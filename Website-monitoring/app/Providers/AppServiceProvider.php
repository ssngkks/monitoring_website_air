<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('ingest', function (Request $request) {
            $key = $request->input('kode_node', $request->ip());

            return Limit::perMinute(60)->by($key);
        });

        RateLimiter::for('auth', function (Request $request) {
            $key = strtolower((string) $request->input('email')).'|'.$request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        \Illuminate\Support\Facades\Auth::provider('custom', function ($app, array $config) {
            return new \App\Auth\FirestoreUserProvider($app->make(\App\Repositories\UserRepository::class));
        });

        \Illuminate\Support\Facades\Auth::extend('custom', function ($app, $name, array $config) {
            return new \Illuminate\Auth\RequestGuard(function ($request) {
                return $request->attributes->get('user');
            }, $app['request'], $app['auth']->createUserProvider($config['provider'] ?? null));
        });
    }
}
