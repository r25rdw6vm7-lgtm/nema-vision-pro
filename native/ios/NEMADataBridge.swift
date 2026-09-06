import Foundation

/// Native ingress contract for NEMA Drive.
/// The host app supplies real SDK adapters (HERE Navigate, Vision/Core ML, vehicle data, etc.).
public protocol NEMADataAdapter {
    var name: String { get }
    var capabilities: [String: Bool] { get }
}

public protocol NEMATrafficAdapter: NEMADataAdapter {
    func fetchTraffic(latitude: Double, longitude: Double, completion: @escaping (Result<[String: Any], Error>) -> Void)
}

public protocol NEMAVisionAdapter: NEMADataAdapter {
    func detect(frame: Any, completion: @escaping (Result<[[String: Any]], Error>) -> Void)
}

public protocol NEMAOfflineRoutingAdapter: NEMADataAdapter {
    func route(from: (lat: Double, lon: Double), to: (lat: Double, lon: Double), completion: @escaping (Result<[String: Any], Error>) -> Void)
}

public protocol NEMA3DMapAdapter: NEMADataAdapter {
    func loadScene(latitude: Double, longitude: Double, completion: @escaping (Result<[String: Any], Error>) -> Void)
}

public final class NEMADataBridge {
    public static let shared = NEMADataBridge()
    private var adapters: [String: NEMADataAdapter] = [:]

    private init() {}

    public func register(_ adapter: NEMADataAdapter) {
        adapters[adapter.name] = adapter
    }

    public func status() -> [String: Any] {
        var result: [String: Any] = [:]
        adapters.forEach { result[$0.key] = $0.value.capabilities }
        return ["registered": result, "count": adapters.count]
    }

    /// Send a normalized event to the web/runtime layer.
    /// The WKWebView bridge should forward this as a `window.postMessage` or
    /// evaluate JavaScript against `NEMARealData`.
    public func event(_ name: String, payload: [String: Any]) -> [String: Any] {
        return ["name": name, "payload": payload, "timestamp": Date().timeIntervalSince1970 * 1000]
    }
}
