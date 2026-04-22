import bpy
import math
import mathutils

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Trunk
bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=10, location=(0, 0, -5), rotation=(0, 0, 0))
trunk = bpy.context.object
trunk.name = 'Trunk'
trunk.scale = (0.5, 0.5, 1)
trunk.location = (0, 0, 0)

# Taper trunk
bpy.ops.object.select_all(action='DESELECT')
trunk.select_set(True)
bpy.context.view_layer.objects.active = trunk
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.bisect(type_normal=(0, 0, 1), clear_outer=True, clear_inner=True, use_fill=True, cuts=1)
bpy.ops.mesh.select_all(action='DESELECT')
bpy.ops.object.mode_set(mode='OBJECT')

# Root flare
bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.5, location=(0, 0, -1), rotation=(0, 0, 0))
root_flare = bpy.context.object
root_flare.name = 'Root Flare'
root_flare.scale = (1, 1, 0.5)

# Primary branches
primary_branches = []
for i in range(7):
    angle = i * math.pi / 3.5
    radius = 0.5
    depth = 5
    location = (0, 0, 5)
    rotation = (angle, 0, 0)
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rotation)
    branch = bpy.context.object
    branch.name = f'Primary Branch {i}'
    branch.scale = (0.5, 0.5, 1)
    primary_branches.append(branch)

# Secondary branches
secondary_branches = []
for i in range(15):
    angle = i * math.pi / 7.5
    radius = 0.2
    depth = 3
    location = (0, 0, 7)
    rotation = (angle, 0, 0)
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=location, rotation=rotation)
    branch = bpy.context.object
    branch.name = f'Secondary Branch {i}'
    branch.scale = (0.5, 0.5, 1)
    secondary_branches.append(branch)

# Leafy canopy
leaf_clusters = []
for i in range(10):
    radius = 1
    location = (0, 0, 10)
    rotation = (0, 0, i * math.pi / 5)
    bpy.ops.mesh.primitive_ico_sphere_add(radius=radius, subdivisions=2, location=location, rotation=rotation)
    leaf_cluster = bpy.context.object
    leaf_cluster.name = f'Leaf Cluster {i}'
    leaf_cluster.scale = (0.5, 0.5, 0.5)
    leaf_clusters.append(leaf_cluster)

# Materials
bpy.ops.material.new(name='Brown Bark')
bpy.data.materials['Brown Bark'].use_nodes = True
bpy.data.materials['Brown Bark'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.5, 0.3, 0.1, 1)
bpy.data.materials['Brown Bark'].node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.5
bpy.data.materials['Brown Bark'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0

bpy.ops.material.new(name='Leaf Green')
bpy.data.materials['Leaf Green'].use_nodes = True
bpy.data.materials['Leaf Green'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.2, 0.5, 0.2, 1)
bpy.data.materials['Leaf Green'].node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.2
bpy.data.materials['Leaf Green'].node_tree.nodes['Principled BSDF'].inputs['Metallic'].default_value = 0

# Assign materials
trunk.data.materials.append(bpy.data.materials['Brown Bark'])
root_flare.data.materials.append(bpy.data.materials['Brown Bark'])
for branch in primary_branches:
    branch.data.materials.append(bpy.data.materials['Brown Bark'])
for branch in secondary_branches:
    branch.data.materials.append(bpy.data.materials['Brown Bark'])
for leaf_cluster in leaf_clusters:
    leaf_cluster.data.materials.append(bpy.data.materials['Leaf Green'])

# Smooth shading
for obj in [trunk, root_flare] + primary_branches + secondary_branches + leaf_clusters:
    obj.data.polygons.foreach_set('use_smooth', [True] * len(obj.data.polygons))

# Bevel and subdivision
for obj in [trunk, root_flare] + primary_branches + secondary_branches + leaf_clusters:
    mod = obj.modifiers.new(name="Subd", type='SUBSURF')
    mod.levels = 2

if bpy.context.object and bpy.context.object.mode != 'OBJECT':
    bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.export_scene.gltf(
    filepath=r"C:\Users\Hp\Downloads\next-js-frontend-website\next-js-frontend-website\public\models\output.glb",
    export_format='GLB',
    use_selection=False,
    export_apply=True
)