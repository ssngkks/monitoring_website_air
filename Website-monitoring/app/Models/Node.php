<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kode_node',
        'nama_lokasi',
        'api_token_hash',
        'status',
        'last_seen_at',
    ];

    protected $hidden = [
        'api_token_hash',
    ];

    protected function casts(): array
    {
        return [
            'last_seen_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function sensorData()
    {
        return $this->hasMany(SensorData::class);
    }

    public function alerts()
    {
        return $this->hasMany(Alert::class);
    }

    public function hourlyAggregates()
    {
        return $this->hasMany(SensorDataHourly::class);
    }

    public function isOnline(int $withinMinutes = 10): bool
    {
        return $this->last_seen_at !== null
            && $this->last_seen_at->gt(now()->subMinutes($withinMinutes));
    }
}
