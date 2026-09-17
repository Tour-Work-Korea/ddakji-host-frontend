import {useCallback, useEffect, useRef} from 'react';
import {Dimensions, Keyboard, Platform} from 'react-native';
import useKeyboardAwareScrollView from './useKeyboardAwareScrollView';

// Keep enough scroll range even when the room sheet has a fixed height.
export default function useRoomDiscountKeyboard() {
  const {scrollRef, contentContainerStyle} = useKeyboardAwareScrollView({
    // Android already shrinks the scroll viewport with adjustResize.
    iosOnly: true,
  });
  const focusedInput = useRef(null);
  const frame = useRef(null);

  const scrollToInput = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (focusedInput.current != null) {
        const input = focusedInput.current;
        const scroll = scrollRef.current;
        const revealInput = offset => {
          if (focusedInput.current === input) {
            scroll?.scrollResponderScrollNativeHandleToKeyboard(
              input,
              offset,
              true,
            );
          }
        };
        if (Platform.OS === 'android' && scroll?.measureInWindow) {
          scroll.measureInWindow((x, y, width, height) => {
            const keyboardTop =
              Keyboard.metrics()?.screenY ?? Dimensions.get('window').height;
            // Include the footer below the resized viewport, so the input is
            // visible above the scroll boundary as well as above the keyboard.
            revealInput(24 + Math.max(0, keyboardTop - (y + height)));
          });
        } else {
          revealInput(24);
        }
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
    onLayout: scrollToInput,
    onInputFocus: event => {
      focusedInput.current = event.nativeEvent.target;
      scrollToInput();
    },
    onInputBlur: () => {
      focusedInput.current = null;
    },
  };
}
