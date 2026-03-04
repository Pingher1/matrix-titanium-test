import bpy
import os
import sys

def convert_fbx_to_glb(fbx_path, output_path):
    """
    Convert FBX to GLB format while preserving skeletal rigging
    """
    # Clear existing mesh data
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Import FBX
    bpy.ops.import_scene.fbx(filepath=fbx_path)
    
    # Select all objects for export
    bpy.ops.object.select_all(action='SELECT')
    
    # Export as GLB with optimized settings for @react-three/drei
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_selected=False,
        export_apply=True,
        export_animations=True,
        export_frame_range=True,
        export_force_sampling=False,
        export_nla_strips=True,
        export_def_bones=True,
        export_optimize_animation_size=False,
        export_anim_single_armature=True,
        export_reset_pose_bones=True,
        export_current_frame=False,
        export_skins=True,
        export_all_influences=False,
        export_morph=True,
        export_morph_normal=True,
        export_morph_tangent=False,
        export_lights=False,
        export_displacement=False,
        will_save_settings=True,
        export_copyright="",
        export_image_format='AUTO',
        export_texture_dir="",
        export_jpeg_quality=75,
        export_keep_originals=False,
        export_texcoords=True,
        export_normals=True,
        export_draco_mesh_compression_enable=False,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        export_draco_color_quantization=10,
        export_draco_generic_quantization=12,
        export_tangents=False,
        export_materials='EXPORT',
        export_colors=True,
        use_mesh_edges=False,
        use_mesh_vertices=False,
        export_cameras=False,
        use_selection=False,
        use_visible=False,
        use_renderable=False,
        use_active_collection=False,
        export_extras=False,
        export_yup=True
    )
    
    print(f"✅ Conversion complete: {output_path}")

if __name__ == "__main__":
    # File paths
    fbx_input = "/Users/philliprichardson/Documents/EPIC - AVIATAR /EPIC AVAITARS/fbx_stylizedfantasycharacters/Mixamo/SM_FantasyFemale_Cloak.fbx"
    glb_output = "/Users/philliprichardson/Documents/EPIC - AVIATAR /EPIC AVAITARS/SM_FantasyFemale_Cloak.glb"
    
    # Ensure input file exists
    if not os.path.exists(fbx_input):
        print(f"❌ Error: FBX file not found at {fbx_input}")
        sys.exit(1)
    
    # Create output directory if needed
    os.makedirs(os.path.dirname(glb_output), exist_ok=True)
    
    # Execute conversion
    convert_fbx_to_glb(fbx_input, glb_output)

