<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Pengawas extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['kordinator_id', 'nama', 'nip'];

    public function kordinator(): BelongsTo
    {
        return $this->belongsTo(Kordinator::class);
    }

    public function petugas(): HasMany
    {
        return $this->hasMany(Petugas::class);
    }

    public function lokasiPagi(): HasOne
    {
        return $this->hasOne(Lokasi::class, 'pengawas_pagi_id');
    }

    public function lokasiSiang(): HasOne
    {
        return $this->hasOne(Lokasi::class, 'pengawas_siang_id');
    }

    public function lokasiMalam(): HasOne
    {
        return $this->hasOne(Lokasi::class, 'pengawas_malam_id');
    }
}
