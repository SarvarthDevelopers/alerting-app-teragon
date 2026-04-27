import { useState } from 'react';
import { ArrowLeft, UserPlus, Shield, Trash2 } from 'lucide-react';
import { users as defaultUsers } from '../../data/settingsData';
import { User, UserRole } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    fullName: '',
    role: 'OPERATOR',
    isActive: true,
    forcePinChange: true
  });

  const addUser = () => {
    if (newUser.username && newUser.fullName) {
      setUsers([
        ...users,
        {
          id: `u${users.length + 1}`,
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role as UserRole,
          isActive: newUser.isActive!,
          forcePinChange: newUser.forcePinChange!,
          createdAt: new Date().toISOString()
        }
      ]);
      setNewUser({
        username: '',
        fullName: '',
        role: 'OPERATOR',
        isActive: true,
        forcePinChange: true
      });
      setShowAddUser(false);
    }
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const deleteUser = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-destructive text-destructive-foreground';
      case 'LEAD':
        return 'bg-alert-escalated text-alert-escalated-foreground';
      default:
        return 'bg-primary/20 text-primary-foreground';
    }
  };

  return (
    <div className="bg-background pb-20">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} user{users.length !== 1 ? 's' : ''} • Manage access and permissions
            </p>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            <UserPlus size={20} />
          </button>
        </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-3">
        <AnimatePresence>
          {showAddUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border-2 border-primary rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <UserPlus size={18} />
                  Add New User
                </h3>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })}
                    placeholder="operator.smith"
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Role
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['OPERATOR', 'LEAD', 'ADMIN'] as UserRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => setNewUser({ ...newUser, role })}
                        className={`py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          newUser.role === role
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-foreground">Force PIN Change</span>
                  <button
                    onClick={() => setNewUser({ ...newUser, forcePinChange: !newUser.forcePinChange })}
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      newUser.forcePinChange ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                        newUser.forcePinChange ? 'right-0.5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={addUser}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    CREATE USER
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/70 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-card border border-border rounded-xl p-4 ${
              !user.isActive && 'opacity-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-foreground">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground font-mono">{user.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={14} />
                <span>Account {user.isActive ? 'Active' : 'Disabled'}</span>
              </div>
              <button
                onClick={() => toggleUserActive(user.id)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  user.isActive ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                    user.isActive ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
