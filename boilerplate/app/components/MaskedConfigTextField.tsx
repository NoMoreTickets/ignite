import React, { ComponentType, forwardRef, Ref, useImperativeHandle, useRef } from "react"
import { StyleProp, TextStyle, ColorValue, View, ViewStyle, TouchableOpacity } from "react-native"
import { observer } from "mobx-react-lite"
import { TextFieldProps } from "./TextField"
import { MaskedTextInput, MaskedTextInputProps } from "react-native-mask-text"
// import { translate } from "i18n-js"
import { isRTL, translate } from "../../i18n"
import { colors, spacing, typography } from "../../theme"
import { Text, TextProps } from "../Text"
import { TextInput } from "react-native-gesture-handler"

export interface MaskedConfigTextFieldProps
  extends MaskedTextInputProps,
    Omit<TextFieldProps, "onChangeText"> {
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>

  /**
   * The color of the label displayed above the text field
   */
  labelColor?: ColorValue

  /**
   * A text value bound to an object (e.g. a mobx-state-tree object)
   */
  textValue?: string
}

/**
 * Describe your component here
 */
export const MaskedConfigTextField = observer(
  forwardRef(function MaskedConfigTextField(
    props: MaskedConfigTextFieldProps,
    ref: Ref<TextInput>,
  ) {
    const { style } = props
    const $styles = [$container, style]

    const {
      labelTx,
      label,
      labelTxOptions,
      labelColor = "black",
      placeholder,
      placeholderTx,
      placeholderTxOptions,
      helper,
      helperTx,
      helperTxOptions,
      status,
      RightAccessory,
      LeftAccessory,
      HelperTextProps,
      LabelTextProps,
      style: $inputStyleOverride,
      containerStyle: $containerStyleOverride,
      inputWrapperStyle: $inputWrapperStyleOverride,
      mask,
      ...TextInputProps
    } = props

    const input = useRef<TextInput>()

    const disabled = TextInputProps.editable === false || status === "disabled"

    const placeholderContent = placeholderTx
      ? translate(placeholderTx, placeholderTxOptions)
      : placeholder

    const $containerStyles = [$containerStyleOverride]

    const $labelStyles = [$labelStyle, LabelTextProps?.style]

    const $inputWrapperStyles = [
      $inputWrapperStyle,
      status === "error" && { borderColor: colors.error },
      TextInputProps.multiline && { minHeight: 112 },
      LeftAccessory && { paddingStart: 0 },
      RightAccessory && { paddingEnd: 0 },
      $inputWrapperStyleOverride,
    ]

    const $inputStyles = [
      $inputStyle,
      disabled && { color: colors.textDim },
      isRTL && { textAlign: "right" as TextStyle["textAlign"] },
      TextInputProps.multiline && { height: "auto" },
      $inputStyleOverride,
    ]

    const $helperStyles = [
      $helperStyle,
      status === "error" && { color: colors.error },
      HelperTextProps?.style,
    ]

    function focusInput() {
      if (disabled) return

      input.current?.focus()
    }

    useImperativeHandle(ref, () => input.current)

    // return (
    //   <View style={$styles}>
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={$containerStyles}
        onPress={focusInput}
        accessibilityState={{ disabled }}
      >
        {!!(props.placeholder || props.placeholderTx) && (
          <Text
            preset="formLabel"
            text={props.textValue ? placeholderContent : "."}
            txOptions={labelTxOptions}
            style={[$labelStyles, { color: props.textValue ? labelColor : colors.transparent }]}
          />
        )}

        <View style={$inputWrapperStyles}>
          {!!LeftAccessory && (
            <LeftAccessory
              style={$leftAccessoryStyle}
              status={status}
              editable={!disabled}
              multiline={TextInputProps.multiline}
            />
          )}

          <MaskedTextInput
            ref={input}
            underlineColorAndroid={colors.transparent}
            textAlignVertical="top"
            mask={mask}
            placeholder={placeholderContent}
            placeholderTextColor={colors.textDim}
            onChangeText={(text, rawText) => {
              console.log(text)
              console.log(rawText)
            }}
            style={$inputStyle}
            {...props}
          />

          {!!RightAccessory && (
            <RightAccessory
              style={$rightAccessoryStyle}
              status={status}
              editable={!disabled}
              multiline={TextInputProps.multiline}
            />
          )}
        </View>

        {!!(helper || helperTx) && (
          <Text
            preset="formHelper"
            text={helper}
            tx={helperTx}
            txOptions={helperTxOptions}
            {...HelperTextProps}
            style={$helperStyles}
          />
        )}
      </TouchableOpacity>
    )
  }),
)

const $container: ViewStyle = {
  justifyContent: "center",
}

// const $text: TextStyle = {
//   fontFamily: typography.primary.normal,
//   fontSize: 14,
//   color: colors.palette.primary500,
// }

const $labelStyle: TextStyle = {
  marginBottom: spacing.extraSmall,
}

const $inputWrapperStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  borderWidth: 1,
  borderRadius: 4,
  backgroundColor: colors.palette.neutral200,
  borderColor: colors.palette.neutral400,
  overflow: "hidden",
}

const $inputStyle: TextStyle = {
  flex: 1,
  alignSelf: "stretch",
  fontFamily: typography.primary.normal,
  color: colors.text,
  fontSize: 16,
  height: 24,
  // https://github.com/facebook/react-native/issues/21720#issuecomment-532642093
  paddingVertical: 0,
  paddingHorizontal: 0,
  marginVertical: spacing.extraSmall,
  marginHorizontal: spacing.small,
}

const $helperStyle: TextStyle = {
  marginTop: spacing.extraSmall,
}

const $rightAccessoryStyle: ViewStyle = {
  marginEnd: spacing.extraSmall,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
}
const $leftAccessoryStyle: ViewStyle = {
  marginStart: spacing.extraSmall,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
}
