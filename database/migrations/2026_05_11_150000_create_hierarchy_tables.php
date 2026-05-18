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
        Schema::create('kordinators', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('pengawas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kordinator_id')->constrained('kordinators')->cascadeOnDelete();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::create('petugas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('pengawas_id')->constrained('pengawas')->cascadeOnDelete();
            $table->string('nama');
            $table->timestamps();
        });

        Schema::table('lokasis', function (Blueprint $table) {
            $table->foreignUuid('pengawas_id')->nullable()->after('id')->constrained('pengawas')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropForeign(['pengawas_id']);
            $table->dropColumn('pengawas_id');
        });

        Schema::dropIfExists('petugas');
        Schema::dropIfExists('pengawas');
        Schema::dropIfExists('kordinators');
    }
};
