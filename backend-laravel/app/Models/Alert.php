<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = ['node_id', 'pesan', 'severity', 'is_read'];

    protected $casts = ['severity' => 'string', 'is_read' => 'boolean'];

    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class);
    }
}