import React from 'react'
import { Box, Text } from '@chakra-ui/react'

interface CircularProgressProps {
  value: number
  size?: number | string
  thickness?: number
  color?: string
  trackColor?: string
  showLabel?: boolean
  label?: string
  children?: React.ReactNode
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 60,
  thickness = 4,
  color = 'blue.500',
  trackColor = 'gray.200',
  showLabel = true,
  label,
  children,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), 100)
  const sizeValue = typeof size === 'number' ? size : parseInt(size)
  const radius = (sizeValue - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(normalizedValue / 100) * circumference} ${circumference}`

  return (
    <Box position="relative" display="inline-block">
      <svg
        width={sizeValue}
        height={sizeValue}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track circle */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          fill="none"
          stroke={`var(--chakra-colors-${trackColor.replace('.', '-')})`}
          strokeWidth={thickness}
        />
        {/* Progress circle */}
        <circle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          fill="none"
          stroke={`var(--chakra-colors-${color.replace('.', '-')})`}
          strokeWidth={thickness}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.3s ease',
          }}
        />
      </svg>
      
      {/* Label */}
      {(showLabel || children) && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          {children || (
            <Text
              fontSize={sizeValue < 40 ? 'xs' : 'sm'}
              fontWeight="bold"
            >
              {label || `${Math.round(normalizedValue)}%`}
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}

// 带动画的版本
export const AnimatedCircularProgress: React.FC<CircularProgressProps & {
  duration?: number
}> = ({ duration = 1000, ...props }) => {
  const [animatedValue, setAnimatedValue] = React.useState(0)

  React.useEffect(() => {
    const startTime = Date.now()
    const startValue = animatedValue
    const targetValue = props.value

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = startValue + (targetValue - startValue) * easeOut

      setAnimatedValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [props.value, duration])

  return <CircularProgress {...props} value={animatedValue} />
}

// 预设样式的变体
export const CircularProgressVariants = {
  success: (props: Omit<CircularProgressProps, 'color'>) => (
    <CircularProgress {...props} color="green.500" />
  ),
  warning: (props: Omit<CircularProgressProps, 'color'>) => (
    <CircularProgress {...props} color="yellow.500" />
  ),
  error: (props: Omit<CircularProgressProps, 'color'>) => (
    <CircularProgress {...props} color="red.500" />
  ),
  info: (props: Omit<CircularProgressProps, 'color'>) => (
    <CircularProgress {...props} color="blue.500" />
  ),
}