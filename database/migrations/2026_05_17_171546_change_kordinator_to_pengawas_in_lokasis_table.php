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
            if (Schema::hasColumn('lokasis', 'kordinator_id')) {
                // SQLite may not support dropForeign easily without a separate package,
                // but we will wrap it in try-catch just in case it fails after checking the column
                try {
                    $table->dropForeign(['kordinator_id']);
                } catch (\Exception $e) {}
                $table->dropColumn('kordinator_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->foreignUuid('kordinator_id')->nullable()->after('id')->constrained('kordinators')->nullOnDelete();
        });
    }
};
