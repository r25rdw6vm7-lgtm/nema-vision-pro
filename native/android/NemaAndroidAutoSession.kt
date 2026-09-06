package com.nemadrive.nativebridge

import androidx.car.app.Screen
import androidx.car.app.Session
import androidx.car.app.CarContext
import androidx.car.app.model.Action
import androidx.car.app.model.MessageTemplate
import androidx.car.app.model.Template
import androidx.car.app.model.CarIcon
import androidx.core.graphics.drawable.IconCompat

class NemaAndroidAutoSession : Session() {
    override fun onCreateScreen(intent: android.content.Intent): Screen = NemaHomeScreen(carContext)
}

private class NemaHomeScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template = MessageTemplate.Builder("NEMA Drive hazır")
        .setTitle("NEMA Drive")
        .setHeaderAction(Action.APP_ICON)
        .addAction(Action.Builder()
            .setTitle("Navigasyonu Aç")
            .setOnClickListener { screenManager.push(NemaHomeScreen(carContext)) }
            .build())
        .build()
}
