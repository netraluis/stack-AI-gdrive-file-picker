import { TableRow, TableCell } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  showDateColumn?: boolean
}

/**
 * Renders skeleton loading state for the resource table
 */
export function TableSkeleton({ rows = 5, showDateColumn = true }: TableSkeletonProps) {
  return (
    <>
      {Array(rows)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i}>
            <TableCell className="w-[50px]">
              <Skeleton className="h-4 w-4" />
            </TableCell>
            <TableCell className="w-[50px]">
              <Skeleton className="h-5 w-5" />
            </TableCell>
            <TableCell className="w-[250px]">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            {showDateColumn && (
              <TableCell className="w-[150px]">
                <Skeleton className="h-4 w-24" />
              </TableCell>
            )}
            <TableCell className="w-[120px]">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="w-[100px] text-right">
              <Skeleton className="h-4 w-8 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
    </>
  )
}