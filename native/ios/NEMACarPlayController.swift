import CarPlay
import Foundation

/// CarPlay presentation shell. Route calculations and safety decisions remain in NEMA's core.
@available(iOS 14.0, *)
public final class NEMACarPlayController: NSObject, CPTemplateApplicationSceneDelegate {
    private var interfaceController: CPInterfaceController?

    public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                         didConnect interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController

        let search = CPBarButton(title: "Ara") { [weak self] _ in
            self?.showSearch()
        }
        let map = CPMapTemplate()
        map.mapDelegate = nil
        map.trailingNavigationBarButtons = [search]

        interfaceController.setRootTemplate(map, animated: true)
    }

    public func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene,
                                         didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        self.interfaceController = nil
    }

    private func showSearch() {
        let template = CPSearchTemplate()
        template.delegate = nil
        interfaceController?.pushTemplate(template, animated: true)
    }
}
