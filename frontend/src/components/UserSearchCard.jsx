import React from 'react'
import { Link } from 'react-router-dom'

function UserSearchCard({ user, onClose }) {
    return (
      <>
        <Link
          to={"/" + user?._id}
          onClick={onClose}
          className="flex items-center gap-3 p-2 lg:p-4 border border-transparent border-b-slate-200 hover:border hover:border-primary rounded cursor-pointer"
        >
          <div>
            <div
              width={50}
              height={50}
              name={user?.name}
              userId={user?._id}
              
            ></div>
          </div>
          <div>
            <div className="font-semibold text-white text-ellipsis line-clamp-1">
              {user?.name}
            </div>
            <p className="text-sm text-ellipsis text-white line-clamp-1">{user?.email}</p>
          </div>
        </Link>
      </>
    );
}

export default UserSearchCard
