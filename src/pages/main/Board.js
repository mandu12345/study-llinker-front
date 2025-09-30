import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Board = () => {
  const [tab, setTab] = useState("FREE");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/study-posts')
      .then(res => {
        setPosts(res.data.filter(p => p.type === tab));
      })
      .catch(err => console.error(err));
  }, [tab]);

  return (
    <div className="container mt-4">
      <h2>게시판</h2>
      <div className="btn-group mb-3">
        <button className={`btn btn-${tab==="FREE"?"primary":"outline-primary"}`} onClick={()=>setTab("FREE")}>자유게시판</button>
        <button className={`btn btn-${tab==="STUDY"?"primary":"outline-primary"}`} onClick={()=>setTab("STUDY")}>스터디 모집</button>
        <button className={`btn btn-${tab==="REVIEW"?"primary":"outline-primary"}`} onClick={()=>setTab("REVIEW")}>스터디 리뷰</button>
      </div>

      {/* 글쓰기 버튼 */}
      <div className="mb-3 text-end">
        <button
          className="btn btn-success"
          onClick={() => navigate("/main/board/write")}
        >
          ✍️ 글쓰기
        </button>
      </div>

      {posts.length>0 ? (
        <ul className="list-group">
          {posts.map(p=>(
            <li key={p.postId} className="list-group-item">
              <h5>{p.title}</h5>
              <p>{p.content}</p>
            </li>
          ))}
        </ul>
      ) : <p>게시글이 없습니다.</p>}
    </div>
  );
};

export default Board;
