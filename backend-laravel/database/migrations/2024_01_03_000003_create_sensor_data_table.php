<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sensor_data', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('node_id');
            $table->decimal('ph', 5, 2);
            $table->decimal('temp', 5, 2);
            $table->decimal('humidity', 5, 2);
            $table->decimal('turbidity', 5, 2);
            $table->decimal('water_level', 10, 2);
            $table->decimal('vibration', 5, 2);
            $table->enum('ai_status', ['Normal', 'Bahaya', 'Anomali']);
            $table->timestamp('created_at')->useCurrent();

            $table->index('node_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_data');
    }
};