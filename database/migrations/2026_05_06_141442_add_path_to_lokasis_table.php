<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            if (!Schema::hasColumn('lokasis', 'type')) {
                $table->string('type')->default('point')->after('lokasi');
            }
            if (!Schema::hasColumn('lokasis', 'path')) {
                $table->json('path')->nullable()->after('longitude');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropColumn(['type', 'path']);
        });
    }
};
