import { Flex, Spin } from 'antd';

// Shown while the initial fetch is in flight (state.loading === true).
export function LoadingState() {
  return (
    <Flex justify="center" style={{ padding: 48 }}>
      <Spin size="large" description="Loading todos..." />
    </Flex>
  );
}
