from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_db

router = APIRouter()


class FollowData(BaseModel):
    source_id: int
    target_id: int


@router.post("/follow", status_code=201)
def follow_user(data: FollowData, conn=Depends(get_db)):
    if data.source_id == data.target_id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    cur = conn.cursor()

    # Check both users exist
    cur.execute("SELECT id FROM users WHERE id = %s", (data.target_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already following
    cur.execute(
        "SELECT id FROM follow WHERE source_id = %s AND target_id = %s",
        (data.source_id, data.target_id)
    )
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Already following this user")

    cur.execute(
        "INSERT INTO follow (source_id, target_id) VALUES (%s, %s)",
        (data.source_id, data.target_id)
    )
    conn.commit()
    return {"message": "Followed successfully"}


@router.delete("/follow")
def unfollow_user(data: FollowData, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM follow WHERE source_id = %s AND target_id = %s",
        (data.source_id, data.target_id)
    )
    conn.commit()
    return {"message": "Unfollowed successfully"}


@router.get("/users/{user_id}/followers")
def get_followers(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.name FROM users u JOIN follow f ON f.source_id = u.id WHERE f.target_id = %s",
        (user_id,)
    )
    followers = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]
    return {"count": len(followers), "followers": followers}


@router.get("/users/{user_id}/following")
def get_following(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.name FROM users u JOIN follow f ON f.target_id = u.id WHERE f.source_id = %s",
        (user_id,)
    )
    following = [{"id": r[0], "name": r[1]} for r in cur.fetchall()]
    return {"count": len(following), "following": following}
