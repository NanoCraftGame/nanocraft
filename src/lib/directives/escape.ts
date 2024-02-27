export function escape(node: Node) {
	const handleClick = (event: MouseEvent) => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('escape', { detail: event }))
		}
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			node.dispatchEvent(new CustomEvent('escape', { detail: event }))
		}
	}

	document.addEventListener('click', handleClick, true)
	document.addEventListener('keydown', handleKeydown, true)

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true)
			document.removeEventListener('keydown', handleKeydown, true)
		},
	}
}
