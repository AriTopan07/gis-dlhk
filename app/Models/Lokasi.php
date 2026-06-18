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
        'kategori',
        'ukuran',
        'latitude',
        'longitude',
        'type',
        'path',
        'pengawas_pagi_id',
        'pengawas_siang_id',
        'pengawas_malam_id',
    ];

    protected $casts = [
        'path' => 'array',
    ];

    /**
     * Get the supervisor (pengawas) assigned to this location for morning shift.
     */
    public function pengawasPagi(): BelongsTo
    {
        return $this->belongsTo(Pengawas::class, 'pengawas_pagi_id');
    }

    /**
     * Get the supervisor (pengawas) assigned to this location for afternoon shift.
     */
    public function pengawasSiang(): BelongsTo
    {
        return $this->belongsTo(Pengawas::class, 'pengawas_siang_id');
    }

    /**
     * Get the supervisor (pengawas) assigned to this location for night shift.
     */
    public function pengawasMalam(): BelongsTo
    {
        return $this->belongsTo(Pengawas::class, 'pengawas_malam_id');
    }

    public function ulasan(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Ulasan::class);
    }
}
