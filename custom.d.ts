interface MaxinShape {
	type: string
	x: number
	y: number
}
interface Round extends MaxinShape {
	type: "round"
	radius: number
}
interface Size {
	type: "size"
	name: string
	width: number
	height: number
	guides: Guide[]
	shapes: (Round)[]
}
interface Label {
	type: "label"
	name: string
}
interface Sizes {
	type: "list"
	name: string
	sizes: (Size|Label)[]
}
type listSizes = Sizes[]

interface Settings {
	isCreateGuides: boolean
	isCreateShapes: boolean
	isLockHelperShapes: boolean
}
interface CreateSize extends Size {
	list: string
}