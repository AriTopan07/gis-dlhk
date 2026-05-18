<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lokasi extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'lokasi',
        'latitude',
        'longitude',
        'type',
        'path',
        'pengawas_id',
    ];

    protected $casts = [
        'path' => 'array',
    ];

    /**
     * Get the supervisor (pengawas) assigned to this location.
     */
    public function pengawas(): BelongsTo
    {
        return $this->belongsTo(Pengawas::class, 'pengawas_id');
    }
}
