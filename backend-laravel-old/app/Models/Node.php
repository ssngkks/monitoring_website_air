<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Node extends Model
{
    protected $fillable = ['user_id', 'kode_node', 'nama_lokasi', 'api_token_hash', 'status'];

    protected $casts = ['status' => 'string'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sensorData(): HasMany
    {
        return $this->hasMany(SensorData::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function isOnline(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subMinutes(5));
    }
}