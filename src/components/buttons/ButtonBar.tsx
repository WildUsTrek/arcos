import React from 'react'
import ButtonFullscreen from './ButtonFullscreen'
import ButtonGithub from './ButtonGithub'
import ButtonHelp from './ButtonHelp'
import ButtonPref from './ButtonPref'
import ButtonSgPref from './ButtonSgPref'

const ButtonBar = () => (
  <div role="navigation">
    <ButtonPref />
    <ButtonSgPref />
    <ButtonFullscreen />
    <ButtonHelp />
    <ButtonGithub />
  </div>
)

export default ButtonBar
