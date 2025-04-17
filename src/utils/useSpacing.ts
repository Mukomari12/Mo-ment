import { useWindowDimensions } from 'react-native';

export const useSpacing = () => {
  const { width } = useWindowDimensions();
  const hPad = Math.round(width * 0.06);   // 6% horizontal padding
  return { hPad };
}; 