<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ulasans', function (Blueprint $table) {
            $table->foreignUuid('user_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');
            // Make kordinator_id nullable so superadmin/admin can also create ulasan
            $table->foreignUuid('kordinator_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ulasans', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
