<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->foreignUuid('kordinator_id')->nullable()->after('id')->constrained('kordinators')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('lokasis', function (Blueprint $table) {
            $table->dropForeign(['kordinator_id']);
            $table->dropColumn('kordinator_id');
        });
    }
};
