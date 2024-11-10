// components/CommandMenu.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useSearchUsersQuery } from "@/store/api/searchApi";
import { useDebounce } from "@/hooks/useDebounce";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "cmdk";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const router = useRouter();

  const {
    data: searchResults,
    isFetching,
    isError,
  } = useSearchUsersQuery(debouncedSearch, {
    skip: !debouncedSearch,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border border-input bg-background shadow-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search users...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search users..."
          onValueChange={handleSearch}
          value={searchTerm}
        />
        <CommandList>
          {isFetching ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-red-500">
              Error searching users
            </div>
          ) : !searchResults?.length ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <CommandGroup heading="Users">
              {searchResults.map((user) => (
                <CommandItem
                  key={user.id.toString()}
                  onSelect={() => {
                    router.push(`/profile/${user.id.toString()}`);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {user.profilePic && <AvatarImage src={user.profilePic[0]} />}
                      <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user.username}
                      </span>
                      {user.bio && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {user.bio}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
