# Chakra UI v3 迁移指南

本项目已经迁移到 Chakra UI v3。以下是主要的变化和更新：

## 主要变化

### 1. 主题系统
- 使用新的 `createSystem` 和 `defineConfig` API
- 颜色令牌现在使用 `{ value: string }` 格式
- 组件样式配置有所改变

### 2. 组件 API 变化

#### Provider
```tsx
// v2
<ChakraProvider theme={theme}>

// v3
<ChakraProvider value={system}>
```

#### Modal (已暂时禁用)
```tsx
// v2
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Title</ModalHeader>
    <ModalCloseButton />
    <ModalBody>Content</ModalBody>
    <ModalFooter>Actions</ModalFooter>
  </ModalContent>
</Modal>

// v3 (新的 API，需要重新实现)
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Backdrop />
  <Dialog.Positioner>
    <Dialog.Content>
      <Dialog.Header>Title</Dialog.Header>
      <Dialog.CloseTrigger />
      <Dialog.Body>Content</Dialog.Body>
      <Dialog.Footer>Actions</Dialog.Footer>
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

#### Drawer
```tsx
// v2
<Drawer isOpen={isOpen} onClose={onClose}>
  <DrawerOverlay />
  <DrawerContent>
    <DrawerHeader>Title</DrawerHeader>
    <DrawerBody>Content</DrawerBody>
  </DrawerContent>
</Drawer>

// v3
<Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
  <Drawer.Backdrop />
  <Drawer.Positioner>
    <Drawer.Content>
      <Drawer.Header>Title</Drawer.Header>
      <Drawer.Body>Content</Drawer.Body>
    </Drawer.Content>
  </Drawer.Positioner>
</Drawer.Root>
```

#### Form Fields
```tsx
// v2
<FormControl isInvalid={!!error}>
  <FormLabel>Label</FormLabel>
  <Input />
  <FormErrorMessage>{error}</FormErrorMessage>
</FormControl>

// v3
<Field.Root invalid={!!error}>
  <Field.Label>Label</Field.Label>
  <Input />
  <Field.ErrorText>{error}</Field.ErrorText>
</Field.Root>
```

#### Menu
```tsx
// v2
<Menu>
  <MenuButton as={Button}>Menu</MenuButton>
  <MenuList>
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
  </MenuList>
</Menu>

// v3
<MenuRoot>
  <MenuTrigger asChild>
    <Button>Menu</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem value="item1">Item 1</MenuItem>
    <MenuItem value="item2">Item 2</MenuItem>
  </MenuContent>
</MenuRoot>
```

#### Alert
```tsx
// v2
<Alert status="error">
  <AlertIcon />
  <AlertTitle>Error!</AlertTitle>
  <AlertDescription>Something went wrong</AlertDescription>
</Alert>

// v3
<Alert.Root status="error">
  <Alert.Icon />
  <Alert.Title>Error!</Alert.Title>
  <Alert.Description>Something went wrong</Alert.Description>
</Alert.Root>
```

#### Avatar
```tsx
// v2
<Avatar src="image.jpg" name="John Doe" />

// v3
<Avatar.Root>
  <Avatar.Image src="image.jpg" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

#### Card
```tsx
// v2
<Box bg="white" shadow="md" rounded="lg">
  <Box p={4}>Header</Box>
  <Box p={4}>Body</Box>
</Box>

// v3
<Card.Root>
  <Card.Header>Header</Card.Header>
  <Card.Body>Body</Card.Body>
</Card.Root>
```

#### Tooltip
```tsx
// v2
<Tooltip label="Tooltip text">
  <Button>Hover me</Button>
</Tooltip>

// v3
<Tooltip.Root>
  <Tooltip.Trigger asChild>
    <Button>Hover me</Button>
  </Tooltip.Trigger>
  <Tooltip.Content>Tooltip text</Tooltip.Content>
</Tooltip.Root>
```

#### Checkbox
```tsx
// v2
<Checkbox isChecked={checked} onChange={onChange}>
  Label
</Checkbox>

// v3
<Checkbox.Root checked={checked} onCheckedChange={onChange}>
  <Checkbox.Indicator />
  <Checkbox.Label>Label</Checkbox.Label>
</Checkbox.Root>
```

### 3. 已移除的 Hooks 和组件

#### useColorModeValue
```tsx
// v2
const bg = useColorModeValue('white', 'gray.800')

// v3 - 使用 CSS 变量或条件样式
const bg = { _light: 'white', _dark: 'gray.800' }
```

#### useDisclosure
```tsx
// v2
const { isOpen, onOpen, onClose } = useDisclosure()

// v3 - 使用 useState
const [isOpen, setIsOpen] = useState(false)
const onOpen = () => setIsOpen(true)
const onClose = () => setIsOpen(false)
```

#### Stat 组件
```tsx
// v2
<Stat>
  <StatLabel>Label</StatLabel>
  <StatNumber>123</StatNumber>
  <StatHelpText>
    <StatArrow type="increase" />
    12%
  </StatHelpText>
</Stat>

// v3 - 使用自定义组件
<Box>
  <Text fontSize="sm" color="gray.600">Label</Text>
  <Text fontSize="2xl" fontWeight="bold">123</Text>
  <HStack>
    <Icon as={FiTrendingUp} color="green.500" />
    <Text fontSize="sm" color="green.500">12%</Text>
  </HStack>
</Box>
```

#### CircularProgress
```tsx
// v2
<CircularProgress value={80}>
  <CircularProgressLabel>80%</CircularProgressLabel>
</CircularProgress>

// v3 - 需要自定义实现或使用第三方库
<Box position="relative" display="inline-block">
  <svg width="60" height="60">
    <circle
      cx="30"
      cy="30"
      r="25"
      fill="none"
      stroke="gray.200"
      strokeWidth="4"
    />
    <circle
      cx="30"
      cy="30"
      r="25"
      fill="none"
      stroke="blue.500"
      strokeWidth="4"
      strokeDasharray={`${(80 / 100) * 157} 157`}
      transform="rotate(-90 30 30)"
    />
  </svg>
  <Text
    position="absolute"
    top="50%"
    left="50%"
    transform="translate(-50%, -50%)"
    fontSize="xs"
    fontWeight="bold"
  >
    80%
  </Text>
</Box>
```

## 迁移状态

### ✅ 已完成
- [x] 主题系统配置
- [x] Provider 设置
- [x] 基础组件 (Box, Text, Button, Input 等)
- [x] 布局组件 (Flex, Grid, Stack 等)
- [x] 表单组件 (Field, Checkbox 等)
- [x] 导航组件 (Menu, Breadcrumbs 等)
- [x] 反馈组件 (Alert, Toast 等)
- [x] 数据展示组件 (Table, Badge 等)
- [x] Drawer 组件

### ⏳ 需要重新实现
- [ ] Modal/Dialog 组件 (已暂时禁用)
- [ ] CircularProgress 组件 (已用简单实现替代)
- [ ] 复杂的统计组件

### 📝 注意事项

1. **Modal 功能**: 当前项目中的 Modal 功能已被暂时禁用，需要使用新的 Dialog API 重新实现。

2. **颜色模式**: `useColorModeValue` 已被移除，使用条件样式 `{ _light: 'value', _dark: 'value' }` 替代。

3. **表单验证**: 表单组件的 API 有所改变，但功能保持一致。

4. **测试**: 所有测试已更新以适配新的组件 API。

5. **性能**: Chakra UI v3 提供了更好的性能和更小的包体积。

## 下一步

1. 重新实现 Modal/Dialog 功能
2. 优化 CircularProgress 组件
3. 添加更多的自定义组件
4. 完善主题配置
5. 更新文档和示例