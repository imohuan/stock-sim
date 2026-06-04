import type { App } from 'vue'
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import 'material-symbols/outlined.css'
import '@fontsource/geist/400.css'
import '@fontsource/geist/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '../../style.css'

import AxButton from './AxButton.vue'
import AxInput from './AxInput.vue'
import AxSlider from './AxSlider.vue'
import AxTooltip from './AxTooltip.vue'
import AxAlert from './AxAlert.vue'
import AxDropdown from './AxDropdown.vue'
import AxSelect from './AxSelect.vue'
import AxDialog from './AxDialog.vue'
import AxPropPanel from './AxPropPanel.vue'
import AxSwitch from './AxSwitch.vue'
import { FloatingBall } from './functional'
import { useNotify } from './hooks/useNotify'
import { useFloating } from './hooks/useFloating'
import { provideTeleportTarget, useTeleportTarget } from './hooks/useTeleportTarget'

const _hooks = { useNotify, useFloating, provideTeleportTarget, useTeleportTarget }

const AxiomUI = {
  install(app: App) {
    app.component('AxButton', AxButton)
    app.component('AxInput', AxInput)
    app.component('AxSlider', AxSlider)
    app.component('AxTooltip', AxTooltip)
    app.component('AxAlert', AxAlert)
    app.component('AxDropdown', AxDropdown)
    app.component('AxSelect', AxSelect)
    app.component('AxDialog', AxDialog)
    app.component('AxPropPanel', AxPropPanel)
    app.component('AxSwitch', AxSwitch)
    app.component('AxFloatingBall', FloatingBall)
    app.component('Toaster', Toaster)
  },

  // hooks 挂在 AxiomUI 上，CDN 场景通过 AxiomUI.useNotify() 访问
  ..._hooks,
}

export default AxiomUI
