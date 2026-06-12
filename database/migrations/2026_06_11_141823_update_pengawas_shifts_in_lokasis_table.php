<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            // Drop FK first to avoid SQLite issues
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['pengawas_id']);
            }
            $table->renameColumn('pengawas_id', 'pengawas_pagi_id');
            
            $table->foreignUuid('pengawas_siang_id')
                ->nullable()
                ->constrained('pengawas')
                ->nullOnDelete();
            
            $table->foreignUuid('pengawas_malam_id')
                ->nullable()
                ->constrained('pengawas')
                ->nullOnDelete();
        });
        
        Schema::table('lokasis', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->foreign('pengawas_pagi_id')->references('id')->on('pengawas')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['pengawas_malam_id']);
                $table->dropForeign(['pengawas_siang_id']);
                $table->dropForeign(['pengawas_pagi_id']);
            }
            
            $table->dropColumn(['pengawas_siang_id', 'pengawas_malam_id']);
            $table->renameColumn('pengawas_pagi_id', 'pengawas_id');
        });
        
        Schema::table('lokasis', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->foreign('pengawas_id')->references('id')->on('pengawas')->nullOnDelete();
            }
        });
    }
};
