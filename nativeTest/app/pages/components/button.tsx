import React from 'react'
import {Pressable, Text} from "react-native"

type AppBtnProps = {
    title: String,
    onPress : () => void;

}

export default function Button({title, onPress}: AppBtnProps) {
  return (
    <Pressable onPress={onPress}>
        <Text>
            {title}
        </Text>
    </Pressable>
  )
}

