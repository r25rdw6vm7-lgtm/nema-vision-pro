package com.nemadrive.nativebridge

/** Native ingress contract for NEMA Drive.
 * Host app adapters provide real SDK implementations.
 */
interface NemaDataAdapter {
    val name: String
    val capabilities: Map<String, Boolean>
}

interface NemaTrafficAdapter : NemaDataAdapter {
    suspend fun fetchTraffic(latitude: Double, longitude: Double): Map<String, Any?>
}

interface NemaVisionAdapter : NemaDataAdapter {
    suspend fun detect(frame: Any): List<Map<String, Any?>>
}

interface NemaOfflineRoutingAdapter : NemaDataAdapter {
    suspend fun route(fromLat: Double, fromLon: Double, toLat: Double, toLon: Double): Map<String, Any?>
}

interface Nema3DMapAdapter : NemaDataAdapter {
    suspend fun loadScene(latitude: Double, longitude: Double): Map<String, Any?>
}

object NemaDataBridge {
    private val adapters = linkedMapOf<String, NemaDataAdapter>()

    fun register(adapter: NemaDataAdapter) {
        adapters[adapter.name] = adapter
    }

    fun status(): Map<String, Any> = mapOf(
        "registered" to adapters.mapValues { it.value.capabilities },
        "count" to adapters.size
    )

    fun event(name: String, payload: Map<String, Any?>): Map<String, Any?> = mapOf(
        "name" to name,
        "payload" to payload,
        "timestamp" to System.currentTimeMillis()
    )
}
