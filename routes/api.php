<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    DonationController,
    AidRequestController,
    MatchController,
    NotificationController,
    AdminController,
    SystemSettingsController
};

Route::post('register', [AuthController::class, 'register']);
Route::post('register/check-availability', [AuthController::class, 'checkRegistrationAvailability'])
    ->middleware('throttle:30,1');
Route::post('login', [AuthController::class, 'login']);

// OTP Password Reset Routes
Route::post('forgot-password/send-otp', [AuthController::class, 'sendOtp']);
Route::post('forgot-password/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('forgot-password/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('profile', [AuthController::class, 'updateProfile']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('donations', DonationController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('requests', AidRequestController::class)->parameters(['requests' => 'aidRequest'])->only(['index', 'store', 'update', 'destroy']);
    Route::get('requests/{aidRequest}/document', [AidRequestController::class, 'document']);
    Route::match(['post', 'patch'], 'requests/{aidRequest}/cancel', [AidRequestController::class, 'cancel']);

    Route::get('matches', [MatchController::class, 'index']);
    Route::patch('matches/{match}/schedule', [MatchController::class, 'schedule']);
    Route::patch('matches/{match}/complete', [MatchController::class, 'complete']);
    Route::patch('matches/{match}/cancel', [MatchController::class, 'cancel']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
    Route::delete('notifications', [NotificationController::class, 'clear']);

    Route::prefix('admin')->middleware('role:admin,staff')->group(function () {
        Route::get('stats', [AdminController::class, 'stats']);
        Route::get('reports', [AdminController::class, 'report']);
        Route::get('activities', [AdminController::class, 'activities']);
        Route::get('donations', [AdminController::class, 'donations']);
        Route::get('inventory-movements', [AdminController::class, 'inventoryMovements']);
        Route::post('donations/intake', [AdminController::class, 'storeStaffIntake']);
        Route::patch('donations/{donation}/stock', [AdminController::class, 'updateDonationStock']);
        Route::get('requests', [AdminController::class, 'requests']);
        Route::post('requests/walk-in', [AdminController::class, 'storeWalkInRequest']);
        Route::patch('requests/{aidRequest}', [AdminController::class, 'updateRequest']);
        Route::put('requests/{aidRequest}/content', [AdminController::class, 'editRequestContent']);

        Route::get('matches', [AdminController::class, 'matches']);
        Route::post('matches/run', [AdminController::class, 'run']);
        Route::patch('matches/{match}', [AdminController::class, 'updateMatch']);
        Route::post('matches/{match}/verify-handoff', [AdminController::class, 'verifyHandoffPin']);
        Route::get('export-csv', [AdminController::class, 'exportReportCsv']);

        Route::middleware('role:admin')->group(function () {
            Route::get('settings', [SystemSettingsController::class, 'show']);
            Route::put('settings', [SystemSettingsController::class, 'update']);
            Route::get('users', [AdminController::class, 'users']);
            Route::post('users', [AdminController::class, 'storeUser']);
            Route::patch('users/{user}', [AdminController::class, 'updateUser']);
            Route::delete('users/{user}', [AdminController::class, 'destroyUser']);
            Route::delete('donations/{donation}', [AdminController::class, 'destroyDonation']);
            Route::delete('requests/{aidRequest}', [AdminController::class, 'destroyRequest']);
        });
    });
});
