"""Geographic tiling for Overpass queries.

Splits large state bounding boxes into smaller tiles to avoid timeouts.
Each tile is independently queryable and resumable.
"""

from typing import Iterator

# Approximate tile size in degrees. 0.5° ≈ 35 miles ≈ city-metro scale.
DEFAULT_TILE_SIZE = 0.5


def generate_tiles(
    bounds: tuple[float, float, float, float],
    tile_size: float = DEFAULT_TILE_SIZE,
) -> list[tuple[float, float, float, float]]:
    """
    Split a bounding box into tiles.

    Args:
        bounds: (south, west, north, east) in degrees
        tile_size: tile dimension in degrees (default 0.5°)

    Returns:
        List of (south, west, north, east) tuples for each tile.
    """
    south, west, north, east = bounds
    tiles = []

    lat = south
    while lat < north:
        lon = west
        while lon < east:
            tile_south = lat
            tile_west = lon
            tile_north = min(lat + tile_size, north)
            tile_east = min(lon + tile_size, east)
            tiles.append((tile_south, tile_west, tile_north, tile_east))
            lon += tile_size
        lat += tile_size

    return tiles


def tile_key(state: str, category: str, tile_index: int) -> str:
    """Generate a unique key for a tile query (used for resume tracking)."""
    return f"{state}:{category}:{tile_index}"


def tiles_for_state(
    state: str,
    bounds: tuple[float, float, float, float],
    tile_size: float = DEFAULT_TILE_SIZE,
) -> list[dict]:
    """
    Generate tile metadata for a state.

    Returns list of dicts with: index, bounds, key_prefix
    """
    raw_tiles = generate_tiles(bounds, tile_size)
    return [
        {
            "index": i,
            "bounds": tile,
            "bbox": f"{tile[0]:.4f},{tile[1]:.4f},{tile[2]:.4f},{tile[3]:.4f}",
        }
        for i, tile in enumerate(raw_tiles)
    ]
