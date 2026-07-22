import {
  SCREEN_PREF,
  SCREEN_VOLUME_PREF,
  SCREEN_HELP,
  SCREEN_LANDSCAPE,
  SCREEN_DISCONNECT_NOTICE,
} from '@/constants/ActionTypes'
import styles from './Window.module.scss'

export const screenClassMap = {
  [SCREEN_PREF]: styles.screenpref,
  [SCREEN_VOLUME_PREF]: styles.screenvolumepref,
  [SCREEN_HELP]: styles.screenhelp,
  [SCREEN_LANDSCAPE]: '',
  [SCREEN_DISCONNECT_NOTICE]: '',
}

export const screenTitleMap = {
  [SCREEN_PREF]: 'Campaign',
  [SCREEN_VOLUME_PREF]: 'Sound & Graphics',
  [SCREEN_HELP]: 'Help',
  [SCREEN_LANDSCAPE]: 'Please rotate your device to landscape mode',
  [SCREEN_DISCONNECT_NOTICE]:
    'You and your opponent are disconnected. Please go to "Preferences" and start a new game.',
}
