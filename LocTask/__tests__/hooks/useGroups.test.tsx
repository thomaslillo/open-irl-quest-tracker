import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useGroups } from '../../src/hooks/useGroups';
import * as repository from '../../src/database/taskRepository';

jest.mock('../../src/database/taskRepository');

describe('useGroups', () => {
  const getGroupsMock = repository.getGroups as jest.Mock;
  const saveGroupMock = repository.saveGroup as jest.Mock;
  const deleteGroupMock = repository.deleteGroup as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads groups and updates state', async () => {
    getGroupsMock.mockResolvedValueOnce([{ id: 1, name: 'Home', color: '#fff' }]);

    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([{ id: 1, name: 'Home', color: '#fff' }]);
  });

  it('adds a group and refreshes', async () => {
    getGroupsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 2, name: 'Errands', color: '#000' }]);
    saveGroupMock.mockResolvedValueOnce(2);

    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addGroup({ name: 'Errands', color: '#000' });
    });

    expect(saveGroupMock).toHaveBeenCalledWith({ name: 'Errands', color: '#000' });
    expect(getGroupsMock).toHaveBeenCalledTimes(2);
    expect(result.current.groups).toEqual([{ id: 2, name: 'Errands', color: '#000' }]);
  });

  it('removes a group and refreshes', async () => {
    getGroupsMock
      .mockResolvedValueOnce([{ id: 1, name: 'Home', color: '#fff' }])
      .mockResolvedValueOnce([]);
    deleteGroupMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.removeGroup(1);
    });

    expect(deleteGroupMock).toHaveBeenCalledWith(1);
    expect(getGroupsMock).toHaveBeenCalledTimes(2);
    expect(result.current.groups).toEqual([]);
  });
});
