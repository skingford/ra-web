import { useColorMode } from "@/components/ui/color-mode"
import { Table,ClientOnly, IconButton, Skeleton, Button, HStack } from "@chakra-ui/react"
import { LuMoon, LuSun } from "react-icons/lu"
import './App.css'
import './styles/components.scss'


const items = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
]


function App() {
  const [count, setCount] = useState(0)
  const { toggleColorMode, colorMode } = useColorMode()

  return (
    <>
     <Table.Root size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Product</Table.ColumnHeader>
          <Table.ColumnHeader>Category</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.category}</Table.Cell>
            <Table.Cell textAlign="end">{item.price}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton onClick={toggleColorMode} variant="outline" size="sm">
        {colorMode === "light" ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
      <HStack>
      <Button variant="outline" onClick={toggleColorMode}>
      Toggle Mode
    </Button>
      <Button className="custom-button">Custom SCSS Button</Button>
      <Button onClick={()=>setCount(count+1)}>Click me {count}</Button>
    </HStack>
    </>
  )
}

export default App
