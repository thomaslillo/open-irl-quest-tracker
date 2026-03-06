import { render, screen } from '@testing-library/react-native';
import { MapScreen } from '../../src/screens/MapScreen';

describe('MapScreen', () => {
  it('renders placeholder content', () => {
    render(<MapScreen />);

    expect(screen.getByText('Map Screen')).toBeTruthy();
    expect(screen.getByText('Location-based triggers will appear here.')).toBeTruthy();
  });
});
