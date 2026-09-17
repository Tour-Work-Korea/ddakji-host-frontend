import {useCallback, useEffect, useRef} from 'react';
import {Keyboard} from 'react-native';
import useKeyboardAwareScrollView from './useKeyboardAwareScrollView';

// Keep enough scroll range even when the room sheet has a fixed height.
export default function useRoomDiscountKeyboard() {
  const {scrollRef, contentContainerStyle} = useKeyboardAwareScrollView({
    iosOnly: false,
  });
  const focusedInput = useRef(null);
  const frame = useRef(null);

  const scrollToInput = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (focusedInput.current != null) {
        scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
          focusedInput.current,
          24,
          true,
        );
      }
    });
  }, [scrollRef]);

  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidShow', scrollToInput);
    return () => {
      subscription.remove();
      cancelAnimationFrame(frame.current);
    };
  }, [scrollToInput]);

  return {
    scrollRef,
    // Match the room modal inset while keeping controls inside the scroll viewport.
    contentContainerStyle: {
      width: '100%',
      ...contentContainerStyle,
      paddingHorizontal: 20,
    },
    onContentSizeChange: scrollToInput,
    onInputFocus: event => {
      focusedInput.current = event.nativeEvent.target;
      scrollToInput();
    },
    onInputBlur: () => {
      focusedInput.current = null;
    },
  };
}
