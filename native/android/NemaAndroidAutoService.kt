package com.nemadrive.nativebridge

import androidx.car.app.CarAppService
import androidx.car.app.Session
import androidx.car.app.validation.HostValidator

/** Android Auto entry point. Navigation data is supplied by the NEMA core/native adapter. */
class NemaAndroidAutoService : CarAppService() {
    override fun createHostValidator(): HostValidator = HostValidator.ALLOW_ALL_HOSTS_VALIDATOR

    override fun onCreateSession(): Session = NemaAndroidAutoSession()
}
