<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Petugas extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'petugas';

    protected $fillable = ['pengawas_id', 'nama', 'nik_ktp', 'nip', 'shift'];

    public function pengawas(): BelongsTo
    {
        return $this->belongsTo(Pengawas::class);
    }
}
