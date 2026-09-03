<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sensor_data_hourly', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('node_id');
            $table->decimal('avg_ph', 5, 2);
            $table->decimal('avg_temp', 5, 2);
            $table->decimal('avg_turbidity', 5, 2);
            $table->integer('hour');
            $table->timestamp('created_at')->useCurrent();

            $table->index('node_id');
            $table->unique(['node_id', 'hour']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_data_hourly');
    }
};