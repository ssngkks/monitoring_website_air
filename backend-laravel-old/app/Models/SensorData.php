<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SensorData extends Model
{
    protected $fillable = ['node_id', 'ph', 'temp', 'humidity', 'turbidity', 'water_level', 'vibration', 'ai_status'];

    protected $casts = ['ph' => 'decimal:2', 'temp' => 'decimal:2', 'humidity' => 'decimal:2', 'turbidity' => 'decimal:2', 'water_level' => 'decimal:2', 'vibration' => 'decimal:2'];

    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class);
    }
}