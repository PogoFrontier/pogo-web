interface ShieldProps {
  value: boolean
  onShield: () => void
  shields: number
}

const Shield: React.FC<ShieldProps> = ({ value, onShield, shields }) => {
  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    e.stopPropagation()
    onShield()
  }
  const disabled = value || shields <= 0
  return (
    <button className="btn btn-primary" onClick={onClick} disabled={disabled}>
      {disabled ? "Waiting..." : "Shield?"}
    </button>
  )
}

export default Shield
