<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ulasan extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'kordinator_id',
        'lokasi_id',
        'tanggal',
        'rating',
        'komentar',
        'foto',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function kordinator(): BelongsTo
    {
        return $this->belongsTo(Kordinator::class);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }
}
