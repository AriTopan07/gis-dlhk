<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ulasan extends Model
{
    use HasUuids;

    protected $fillable = [
        'kordinator_id',
        'lokasi_id',
        'tanggal',
        'rating',
        'komentar',
        'status',
    ];

    public function kordinator(): BelongsTo
    {
        return $this->belongsTo(Kordinator::class);
    }

    public function lokasi(): BelongsTo
    {
        return $this->belongsTo(Lokasi::class);
    }
}
